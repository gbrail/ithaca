package org.brail.ithaca.internal.bindings;

import org.mozilla.javascript.SymbolKey;

/**
 * Reproduction of Node.js constants from src/node_constants.cc and src/node_constants.h.
 * System-defined constants are currently initialized to 0 as placeholders.
 */
public class NodeConstants {

  public static class Errno {
    public static final int E2BIG = 7;
    public static final int EACCES = 13;
    public static final int EADDRINUSE = 100;
    public static final int EADDRNOTAVAIL = 101;
    public static final int EAFNOSUPPORT = 102;
    public static final int EAGAIN = 11;
    public static final int EALREADY = 103;
    public static final int EBADF = 9;
    public static final int EBADMSG = 104;
    public static final int EBUSY = 16;
    public static final int ECANCELED = 105;
    public static final int ECHILD = 10;
    public static final int ECONNABORTED = 106;
    public static final int ECONNREFUSED = 107;
    public static final int ECONNRESET = 108;
    public static final int EDEADLK = 36;
    public static final int EDESTADDRREQ = 109;
    public static final int EDOM = 33;
    public static final int EDQUOT = 0; // Not provided by current runtime
    public static final int EEXIST = 17;
    public static final int EFAULT = 14;
    public static final int EFBIG = 27;
    public static final int EHOSTUNREACH = 110;
    public static final int EIDRM = 111;
    public static final int EILSEQ = 42;
    public static final int EINPROGRESS = 112;
    public static final int EINTR = 4;
    public static final int EINVAL = 22;
    public static final int EIO = 5;
    public static final int EISCONN = 113;
    public static final int EISDIR = 21;
    public static final int ELOOP = 114;
    public static final int EMFILE = 24;
    public static final int EMLINK = 31;
    public static final int EMSGSIZE = 115;
    public static final int EMULTIHOP = 0; // Not provided by current runtime
    public static final int ENAMETOOLONG = 38;
    public static final int ENETDOWN = 116;
    public static final int ENETRESET = 117;
    public static final int ENETUNREACH = 118;
    public static final int ENFILE = 23;
    public static final int ENOBUFS = 119;
    public static final int ENODATA = 120;
    public static final int ENODEV = 19;
    public static final int ENOENT = 2;
    public static final int ENOEXEC = 8;
    public static final int ENOLCK = 39;
    public static final int ENOLINK = 121;
    public static final int ENOMEM = 12;
    public static final int ENOMSG = 122;
    public static final int ENOPROTOOPT = 123;
    public static final int ENOSPC = 28;
    public static final int ENOSR = 124;
    public static final int ENOSTR = 125;
    public static final int ENOSYS = 40;
    public static final int ENOTCONN = 126;
    public static final int ENOTDIR = 20;
    public static final int ENOTEMPTY = 41;
    public static final int ENOTSOCK = 128;
    public static final int ENOTSUP = 129;
    public static final int ENOTTY = 25;
    public static final int ENXIO = 6;
    public static final int EOPNOTSUPP = 130;
    public static final int EOVERFLOW = 132;
    public static final int EPERM = 1;
    public static final int EPIPE = 32;
    public static final int EPROTO = 134;
    public static final int EPROTONOSUPPORT = 135;
    public static final int EPROTOTYPE = 136;
    public static final int ERANGE = 34;
    public static final int EROFS = 30;
    public static final int ESPIPE = 29;
    public static final int ESRCH = 3;
    public static final int ESTALE = 0; // Not provided by current runtime
    public static final int ETIME = 137;
    public static final int ETIMEDOUT = 138;
    public static final int ETXTBSY = 139;
    public static final int EWOULDBLOCK = 140;
    public static final int EXDEV = 18;
  }

  public static class WindowsError {
    public static final int WSAEINTR = 10004;
    public static final int WSAEBADF = 10009;
    public static final int WSAEACCES = 10013;
    public static final int WSAEFAULT = 10014;
    public static final int WSAEINVAL = 10022;
    public static final int WSAEMFILE = 10024;
    public static final int WSAEWOULDBLOCK = 10035;
    public static final int WSAEINPROGRESS = 10036;
    public static final int WSAEALREADY = 10037;
    public static final int WSAENOTSOCK = 10038;
    public static final int WSAEDESTADDRREQ = 10039;
    public static final int WSAEMSGSIZE = 10040;
    public static final int WSAEPROTOTYPE = 10041;
    public static final int WSAENOPROTOOPT = 10042;
    public static final int WSAEPROTONOSUPPORT = 10043;
    public static final int WSAESOCKTNOSUPPORT = 10044;
    public static final int WSAEOPNOTSUPP = 10045;
    public static final int WSAEPFNOSUPPORT = 10046;
    public static final int WSAEAFNOSUPPORT = 10047;
    public static final int WSAEADDRINUSE = 10048;
    public static final int WSAEADDRNOTAVAIL = 10049;
    public static final int WSAENETDOWN = 10050;
    public static final int WSAENETUNREACH = 10051;
    public static final int WSAENETRESET = 10052;
    public static final int WSAECONNABORTED = 10053;
    public static final int WSAECONNRESET = 10054;
    public static final int WSAENOBUFS = 10055;
    public static final int WSAEISCONN = 10056;
    public static final int WSAENOTCONN = 10057;
    public static final int WSAESHUTDOWN = 10058;
    public static final int WSAETOOMANYREFS = 10059;
    public static final int WSAETIMEDOUT = 10060;
    public static final int WSAECONNREFUSED = 10061;
    public static final int WSAELOOP = 10062;
    public static final int WSAENAMETOOLONG = 10063;
    public static final int WSAEHOSTDOWN = 10064;
    public static final int WSAEHOSTUNREACH = 10065;
    public static final int WSAENOTEMPTY = 10066;
    public static final int WSAEPROCLIM = 10067;
    public static final int WSAEUSERS = 10068;
    public static final int WSAEDQUOT = 10069;
    public static final int WSAESTALE = 10070;
    public static final int WSAEREMOTE = 10071;
    public static final int WSASYSNOTREADY = 10091;
    public static final int WSAVERNOTSUPPORTED = 10092;
    public static final int WSANOTINITIALISED = 10093;
    public static final int WSAEDISCON = 10101;
    public static final int WSAENOMORE = 10102;
    public static final int WSAECANCELLED = 10103;
    public static final int WSAEINVALIDPROCTABLE = 10104;
    public static final int WSAEINVALIDPROVIDER = 10105;
    public static final int WSAEPROVIDERFAILEDINIT = 10106;
    public static final int WSASYSCALLFAILURE = 10107;
    public static final int WSASERVICE_NOT_FOUND = 10108;
    public static final int WSATYPE_NOT_FOUND = 10109;
    public static final int WSA_E_NO_MORE = 10110;
    public static final int WSA_E_CANCELLED = 10111;
    public static final int WSAEREFUSED = 10112;
  }

  public static class Signals {
    public static final int SIGHUP = 1;
    public static final int SIGINT = 2;
    public static final int SIGQUIT = 3;
    public static final int SIGILL = 4;
    public static final int SIGABRT = 22;
    public static final int SIGFPE = 8;
    public static final int SIGKILL = 9;
    public static final int SIGSEGV = 11;
    public static final int SIGTERM = 15;
    public static final int SIGBREAK = 21;
    public static final int SIGWINCH = 28;
  }

  public static class Priority {
    public static final int PRIORITY_LOW = 19;
    public static final int PRIORITY_BELOW_NORMAL = 10;
    public static final int PRIORITY_NORMAL = 0;
    public static final int PRIORITY_ABOVE_NORMAL = -7;
    public static final int PRIORITY_HIGH = -14;
    public static final int PRIORITY_HIGHEST = -20;
  }

  public static class Crypto {
    public static final int OPENSSL_VERSION_NUMBER = 0;
    public static final int SSL_OP_ALL = 0;
    public static final int SSL_OP_ALLOW_NO_DHE_KEX = 0;
    public static final int SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION = 0;
    public static final int SSL_OP_CIPHER_SERVER_PREFERENCE = 0;
    public static final int SSL_OP_CISCO_ANYCONNECT = 0;
    public static final int SSL_OP_COOKIE_EXCHANGE = 0;
    public static final int SSL_OP_CRYPTOPRO_TLSEXT_BUG = 0;
    public static final int SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS = 0;
    public static final int SSL_OP_LEGACY_SERVER_CONNECT = 0;
    public static final int SSL_OP_NO_COMPRESSION = 0;
    public static final int SSL_OP_NO_ENCRYPT_THEN_MAC = 0;
    public static final int SSL_OP_NO_QUERY_MTU = 0;
    public static final int SSL_OP_NO_RENEGOTIATION = 0;
    public static final int SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION = 0;
    public static final int SSL_OP_NO_SSLv2 = 0;
    public static final int SSL_OP_NO_SSLv3 = 0;
    public static final int SSL_OP_NO_TICKET = 0;
    public static final int SSL_OP_NO_TLSv1 = 0;
    public static final int SSL_OP_NO_TLSv1_1 = 0;
    public static final int SSL_OP_NO_TLSv1_2 = 0;
    public static final int SSL_OP_NO_TLSv1_3 = 0;
    public static final int SSL_OP_PRIORITIZE_CHACHA = 0;
    public static final int SSL_OP_TLS_ROLLBACK_BUG = 0;

    public static final int ENGINE_METHOD_RSA = 0;
    public static final int ENGINE_METHOD_DSA = 0;
    public static final int ENGINE_METHOD_DH = 0;
    public static final int ENGINE_METHOD_RAND = 0;
    public static final int ENGINE_METHOD_EC = 0;
    public static final int ENGINE_METHOD_CIPHERS = 0;
    public static final int ENGINE_METHOD_DIGESTS = 0;
    public static final int ENGINE_METHOD_PKEY_METHS = 0;
    public static final int ENGINE_METHOD_PKEY_ASN1_METHS = 0;
    public static final int ENGINE_METHOD_ALL = 0;
    public static final int ENGINE_METHOD_NONE = 0;

    public static final int DH_CHECK_P_NOT_SAFE_PRIME = 0;
    public static final int DH_CHECK_P_NOT_PRIME = 0;
    public static final int DH_UNABLE_TO_CHECK_GENERATOR = 0;
    public static final int DH_NOT_SUITABLE_GENERATOR = 0;

    public static final int RSA_PKCS1_PADDING = 0;
    public static final int RSA_SSLV23_PADDING = 0;
    public static final int RSA_NO_PADDING = 0;
    public static final int RSA_PKCS1_OAEP_PADDING = 0;
    public static final int RSA_X931_PADDING = 0;
    public static final int RSA_PKCS1_PSS_PADDING = 0;

    public static final int RSA_PSS_SALTLEN_DIGEST = -1;
    public static final int RSA_PSS_SALTLEN_MAX_SIGN = -2;
    public static final int RSA_PSS_SALTLEN_AUTO = -2;

    public static final int RSA_PSS_SALTLEN_DIGEST_VAL =
        0; // Reserved for actual value if different from above
    public static final int RSA_PSS_SALTLEN_MAX_SIGN_VAL = 0;
    public static final int RSA_PSS_SALTLEN_AUTO_VAL = 0;

    public static final String DEFAULT_CIPHER_LIST_CORE =
        "TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:TLS_AES_128_GCM_SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384:DHE-RSA-AES256-SHA384:ECDHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA256:HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA";

    public static final int TLS1_VERSION = 0;
    public static final int TLS1_1_VERSION = 0;
    public static final int TLS1_2_VERSION = 0;
    public static final int TLS1_3_VERSION = 0;

    public static final int POINT_CONVERSION_COMPRESSED = 0;
    public static final int POINT_CONVERSION_UNCOMPRESSED = 0;
    public static final int POINT_CONVERSION_HYBRID = 0;
  }

  public static class Fs {
    public static final int UV_FS_SYMLINK_DIR = 1;
    public static final int UV_FS_SYMLINK_JUNCTION = 2;
    public static final int O_RDONLY = 0;
    public static final int O_WRONLY = 1;
    public static final int O_RDWR = 2;
    public static final int UV_DIRENT_UNKNOWN = 0;
    public static final int UV_DIRENT_FILE = 1;
    public static final int UV_DIRENT_DIR = 2;
    public static final int UV_DIRENT_LINK = 3;
    public static final int UV_DIRENT_FIFO = 4;
    public static final int UV_DIRENT_SOCKET = 5;
    public static final int UV_DIRENT_CHAR = 6;
    public static final int UV_DIRENT_BLOCK = 7;
    public static final int S_IFMT = 61440;
    public static final int S_IFREG = 32768;
    public static final int S_IFDIR = 16384;
    public static final int S_IFCHR = 8192;
    public static final int S_IFBLK = 24576;
    public static final int S_IFIFO = 4096;
    public static final int S_IFLNK = 40960;
    public static final int O_CREAT = 256;
    public static final int O_EXCL = 1024;
    public static final int UV_FS_O_FILEMAP = 536870912;
    public static final int O_TRUNC = 512;
    public static final int O_APPEND = 8;
    public static final int S_IRWXU = 448;
    public static final int S_IRUSR = 256;
    public static final int S_IWUSR = 128;
    public static final int S_IXUSR = 64;
    public static final int S_IRWXG = 56;
    public static final int S_IRGRP = 32;
    public static final int S_IWGRP = 16;
    public static final int S_IXGRP = 8;
    public static final int S_IRWXO = 7;
    public static final int S_IROTH = 4;
    public static final int S_IWOTH = 2;
    public static final int S_IXOTH = 1;
    public static final int F_OK = 0;
    public static final int R_OK = 4;
    public static final int W_OK = 2;
    public static final int X_OK = 1;
    public static final int UV_FS_COPYFILE_EXCL = 1;
    public static final int COPYFILE_EXCL = 1;
    public static final int UV_FS_COPYFILE_FICLONE = 2;
    public static final int COPYFILE_FICLONE = 2;
    public static final int UV_FS_COPYFILE_FICLONE_FORCE = 4;
    public static final int COPYFILE_FICLONE_FORCE = 4;
  }

  public static class Uv {
    public static final int EOF = -4095;
    public static final int UNKNOWN = -4094;
    public static final int EAI_ADDRFAMILY = -3000;
    public static final int EAI_AGAIN = -3001;
    public static final int EAI_BADFLAGS = -3002;
    public static final int EAI_CANCELED = -3003;
    public static final int EAI_FAIL = -3004;
    public static final int EAI_FAMILY = -3005;
    public static final int EAI_MEMORY = -3006;
    public static final int EAI_NODATA = -3007;
    public static final int EAI_NONAME = -3008;
    public static final int EAI_OVERFLOW = -3009;
    public static final int EAI_SERVICE = -3010;
    public static final int EAI_SOCKTYPE = -3011;
    public static final int EAI_BADHINTS = -3013;
    public static final int EAI_PROTOCOL = -3014;
    public static final int E2BIG = -4093;
    public static final int EACCES = -4092;
    public static final int EADDRINUSE = -4091;
    public static final int EADDRNOTAVAIL = -4090;
    public static final int EAFNOSUPPORT = -4089;
    public static final int EAGAIN = -4088;
    public static final int EALREADY = -4084;
    public static final int EBADF = -4083;
    public static final int EBUSY = -4082;
    public static final int ECANCELED = -4081;
    public static final int ECHARSET = -4080;
    public static final int ECONNABORTED = -4079;
    public static final int ECONNREFUSED = -4078;
    public static final int ECONNRESET = -4077;
    public static final int EDESTADDRREQ = -4076;
    public static final int EEXIST = -4075;
    public static final int EFAULT = -4074;
    public static final int EHOSTUNREACH = -4073;
    public static final int EINTR = -4072;
    public static final int EINVAL = -4071;
    public static final int EIO = -4070;
    public static final int EISCONN = -4069;
    public static final int EISDIR = -4068;
    public static final int ELOOP = -4067;
    public static final int EMFILE = -4066;
    public static final int EMSGSIZE = -4065;
    public static final int ENAMETOOLONG = -4064;
    public static final int ENETDOWN = -4063;
    public static final int ENETUNREACH = -4062;
    public static final int ENFILE = -4061;
    public static final int ENOBUFS = -4060;
    public static final int ENODEV = -4059;
    public static final int ENOENT = -4058;
    public static final int ENOMEM = -4057;
    public static final int ENONET = -4056;
    public static final int ENOSPC = -4055;
    public static final int ENOSYS = -4054;
    public static final int ENOTCONN = -4053;
    public static final int ENOTDIR = -4052;
    public static final int ENOTEMPTY = -4051;
    public static final int ENOTSOCK = -4050;
    public static final int ENOTSUP = -4049;
    public static final int EPERM = -4048;
    public static final int EPIPE = -4047;
    public static final int EPROTO = -4046;
    public static final int EPROTONOSUPPORT = -4045;
    public static final int EPROTOTYPE = -4044;
    public static final int EROFS = -4043;
    public static final int ESHUTDOWN = -4042;
    public static final int ESPIPE = -4041;
    public static final int ESRCH = -4040;
    public static final int ETIMEDOUT = -4039;
    public static final int ETXTBSY = -4038;
    public static final int EXDEV = -4037;
    public static final int EFBIG = -4036;
    public static final int ENOPROTOOPT = -4035;
    public static final int ERANGE = -4034;
    public static final int ENXIO = -4033;
    public static final int EMLINK = -4032;
    public static final int EHOSTDOWN = -4031;
    public static final int EREMOTEIO = -4030;
    public static final int ENOTTY = -4029;
    public static final int EFTYPE = -4028;
    public static final int EILSEQ = -4027;
    public static final int EOVERFLOW = -4026;
    public static final int ESOCKTNOSUPPORT = -4025;
    public static final int ENODATA = -4024;
    public static final int EUNATCH = -4023;
    public static final int ENOEXEC = -4022;
  }

  public static class DlOpen {
    public static final int RTLD_LAZY = 0;
    public static final int RTLD_NOW = 0;
    public static final int RTLD_GLOBAL = 0;
    public static final int RTLD_LOCAL = 0;
    public static final int RTLD_DEEPBIND = 0;
  }

  public static class Internal {
    public static final int EXTENSIONLESS_FORMAT_JAVASCRIPT = 0;
    public static final int EXTENSIONLESS_FORMAT_WASM = 1;
  }

  public static class Trace {
    public static final int TRACE_EVENT_PHASE_BEGIN = 0;
    public static final int TRACE_EVENT_PHASE_END = 0;
    public static final int TRACE_EVENT_PHASE_COMPLETE = 0;
    public static final int TRACE_EVENT_PHASE_INSTANT = 0;
    public static final int TRACE_EVENT_PHASE_ASYNC_BEGIN = 0;
    public static final int TRACE_EVENT_PHASE_ASYNC_STEP_INTO = 0;
    public static final int TRACE_EVENT_PHASE_ASYNC_STEP_PAST = 0;
    public static final int TRACE_EVENT_PHASE_ASYNC_END = 0;
    public static final int TRACE_EVENT_PHASE_NESTABLE_ASYNC_BEGIN = 0;
    public static final int TRACE_EVENT_PHASE_NESTABLE_ASYNC_END = 0;
    public static final int TRACE_EVENT_PHASE_NESTABLE_ASYNC_INSTANT = 0;
    public static final int TRACE_EVENT_PHASE_FLOW_BEGIN = 0;
    public static final int TRACE_EVENT_PHASE_FLOW_STEP = 0;
    public static final int TRACE_EVENT_PHASE_FLOW_END = 0;
    public static final int TRACE_EVENT_PHASE_METADATA = 0;
    public static final int TRACE_EVENT_PHASE_COUNTER = 0;
    public static final int TRACE_EVENT_PHASE_SAMPLE = 0;
    public static final int TRACE_EVENT_PHASE_CREATE_OBJECT = 0;
    public static final int TRACE_EVENT_PHASE_SNAPSHOT_OBJECT = 0;
    public static final int TRACE_EVENT_PHASE_DELETE_OBJECT = 0;
    public static final int TRACE_EVENT_PHASE_MEMORY_DUMP = 0;
    public static final int TRACE_EVENT_PHASE_MARK = 0;
    public static final int TRACE_EVENT_PHASE_CLOCK_SYNC = 0;
    public static final int TRACE_EVENT_PHASE_ENTER_CONTEXT = 0;
    public static final int TRACE_EVENT_PHASE_LEAVE_CONTEXT = 0;
    public static final int TRACE_EVENT_PHASE_LINK_IDS = 0;
  }

  public static class Performance {
    public static final int NODE_PERFORMANCE_MILESTONE_TIME_ORIGIN_TIMESTAMP = 0;
    public static final int NODE_PERFORMANCE_MILESTONE_TIME_ORIGIN = 1;
    public static final int NODE_PERFORMANCE_MILESTONE_ENVIRONMENT = 2;
    public static final int NODE_PERFORMANCE_MILESTONE_NODE_START = 3;
    public static final int NODE_PERFORMANCE_MILESTONE_V8_START = 4;
    public static final int NODE_PERFORMANCE_MILESTONE_LOOP_START = 5;
    public static final int NODE_PERFORMANCE_MILESTONE_LOOP_EXIT = 6;
    public static final int NODE_PERFORMANCE_MILESTONE_BOOTSTRAP_COMPLETE = 7;

    public static final int NODE_PERFORMANCE_ENTRY_TYPE_GC = 0;
    public static final int NODE_PERFORMANCE_ENTRY_TYPE_HTTP = 1;
    public static final int NODE_PERFORMANCE_ENTRY_TYPE_HTTP2 = 2;
    public static final int NODE_PERFORMANCE_ENTRY_TYPE_NET = 3;
    public static final int NODE_PERFORMANCE_ENTRY_TYPE_DNS = 4;
    public static final int NODE_PERFORMANCE_ENTRY_TYPE_QUIC = 5;

    public static final int NODE_PERFORMANCE_GC_MAJOR = 0;
    public static final int NODE_PERFORMANCE_GC_MINOR = 0;
    public static final int NODE_PERFORMANCE_GC_INCREMENTAL = 0;
    public static final int NODE_PERFORMANCE_GC_WEAKCB = 0;

    public static final int NODE_PERFORMANCE_GC_FLAGS_NO = 0;
    public static final int NODE_PERFORMANCE_GC_FLAGS_CONSTRUCT_RETAINED = 0;
    public static final int NODE_PERFORMANCE_GC_FLAGS_FORCED = 0;
    public static final int NODE_PERFORMANCE_GC_FLAGS_SYNCHRONOUS_PHANTOM_PROCESSING = 0;
    public static final int NODE_PERFORMANCE_GC_FLAGS_ALL_AVAILABLE_GARBAGE = 0;
    public static final int NODE_PERFORMANCE_GC_FLAGS_ALL_EXTERNAL_MEMORY = 0;
    public static final int NODE_PERFORMANCE_GC_FLAGS_SCHEDULE_IDLE = 0;
  }

  public static class Util {
    // Promise states
    public static final int kPending = 0;
    public static final int kFulfilled = 1;
    public static final int kRejected = 2;

    // Exit info fields
    public static final int kExiting = 0;
    public static final int kExitCode = 1;
    public static final int kHasExitCode = 2;

    // Property filters
    public static final int ALL_PROPERTIES = 0;
    public static final int ONLY_WRITABLE = 1;
    public static final int ONLY_ENUMERABLE = 2;
    public static final int ONLY_CONFIGURABLE = 3;
    public static final int SKIP_STRINGS = 4;
    public static final int SKIP_SYMBOLS = 5;

    // Transfer modes
    public static final int kDisallowCloneAndTransfer = 0;
    public static final int kTransferable = 1;
    public static final int kCloneable = 2;
  }

  public static class OptionTypes {
    public static final int kNoOp = 0;
    public static final int kV8Option = 1;
    public static final int kBoolean = 2;
    public static final int kInteger = 3;
    public static final int kUInteger = 4;
    public static final int kString = 5;
    public static final int kHostPort = 6;
    public static final int kStringList = 7;
  }

  public static class HandleTypes {
    public static final int TCP = 0;
    public static final int TTY = 1;
    public static final int UDP = 2;
    public static final int FILE = 3;
    public static final int PIPE = 4;
    public static final int UNKNOWN = 5;
  }

  public static class TCPConstants {
    public static final int SOCKET = 0;
    public static final int SERVER = 1;
    public static final int UV_TCP_IPV6ONLY = 1;
    public static final int UV_TCP_REUSEPORT = 2;
  }

  public static class UDPConstants {
    public static final int UV_UDP_IPV6ONLY = 1;
    public static final int UV_UDP_REUSEADDR = 2;
    public static final int UV_UDP_REUSEPORT = 3;
  }

  public static class ProviderTypes {
    // NODE_ASYNC_NON_CRYPTO_PROVIDER_TYPES (46 providers, 0-45)
    public static final int NONE = 0;
    public static final int DIRHANDLE = 1;
    public static final int DNSCHANNEL = 2;
    public static final int ELDHISTOGRAM = 3;
    public static final int FILEHANDLE = 4;
    public static final int FILEHANDLECLOSEREQ = 5;
    public static final int BLOBREADER = 6;
    public static final int FSEVENTWRAP = 7;
    public static final int FSREQCALLBACK = 8;
    public static final int FSREQPROMISE = 9;
    public static final int GETADDRINFOREQWRAP = 10;
    public static final int GETNAMEINFOREQWRAP = 11;
    public static final int HEAPSNAPSHOT = 12;
    public static final int HTTP2SESSION = 13;
    public static final int HTTP2STREAM = 14;
    public static final int HTTP2PING = 15;
    public static final int HTTP2SETTINGS = 16;
    public static final int HTTPINCOMINGMESSAGE = 17;
    public static final int HTTPCLIENTREQUEST = 18;
    public static final int LOCKS = 19;
    public static final int DTLS_ENDPOINT = 20;
    public static final int DTLS_SESSION = 21;
    public static final int JSSTREAM = 22;
    public static final int JSUDPWRAP = 23;
    public static final int MESSAGEPORT = 24;
    public static final int PIPECONNECTWRAP = 25;
    public static final int PIPESERVERWRAP = 26;
    public static final int PIPEWRAP = 27;
    public static final int PROCESSWRAP = 28;
    public static final int PROMISE = 29;
    public static final int QUERYWRAP = 30;
    public static final int QUIC_ENDPOINT = 31;
    public static final int QUIC_LOGSTREAM = 32;
    public static final int QUIC_SESSION = 33;
    public static final int QUIC_STREAM = 34;
    public static final int QUIC_UDP = 35;
    public static final int SHUTDOWNWRAP = 36;
    public static final int SIGNALWRAP = 37;
    public static final int STATWATCHER = 38;
    public static final int STREAMPIPE = 39;
    public static final int TCPCONNECTWRAP = 40;
    public static final int TCPSERVERWRAP = 41;
    public static final int TCPWRAP = 42;
    public static final int TTYWRAP = 43;
    public static final int UDPSENDWRAP = 44;
    public static final int UDPWRAP = 45;
    public static final int SIGINTWATCHDOG = 46;
    public static final int WORKER = 47;
    public static final int WORKERCPUPROFILE = 48;
    public static final int WORKERCPUUSAGE = 49;
    public static final int WORKERHEAPPROFILE = 50;
    public static final int WORKERHEAPSNAPSHOT = 51;
    public static final int WORKERHEAPSTATISTICS = 52;
    public static final int WRITEWRAP = 53;
    public static final int ZLIB = 54;

    // NODE_ASYNC_CRYPTO_PROVIDER_TYPES (15 providers, independent count starting at 0)
    public static final int CHECKPRIMEREQUEST = 0;
    public static final int PBKDF2REQUEST = 1;
    public static final int KEYPAIRGENREQUEST = 2;
    public static final int KEYGENREQUEST = 3;
    public static final int KEYEXPORTREQUEST = 4;
    public static final int ARGON2REQUEST = 5;
    public static final int CIPHERREQUEST = 6;
    public static final int DERIVEBITSREQUEST = 7;
    public static final int HASHREQUEST = 8;
    public static final int RANDOMBYTESREQUEST = 9;
    public static final int RANDOMPRIMEREQUEST = 10;
    public static final int SCRYPTREQUEST = 11;
    public static final int SIGNREQUEST = 12;
    public static final int TLSWRAP = 13;
    public static final int VERIFYREQUEST = 14;
  }

  public static class AsyncConstants {
    public static final int kInit = 0;
    public static final int kBefore = 1;
    public static final int After = 2;
    public static final int kDestroy = 3;
    public static final int kTotals = 4;
    public static final int kPromiseResolve = 5;
    public static final int kCheck = 6;
    public static final int kExecutionAsyncId = 7;
    public static final int kAsyncIdCounter = 8;
    public static final int kTriggerAsyncId = 9;
    public static final int kDefaultTriggerAsyncId = 10;
    public static final int kStackLength = 11;
    public static final int kUsesExecutionAsyncResource = 12;
    public static final int kFieldsCount = 13;
  }

  public static class StreamBaseStates {
    public static final int kReadBytesOrError = 0;
    public static final int kArrayBufferOffset = 1;
    public static final int kBytesWritten = 2;
    public static final int kLastWriteWasAsync = 3;
    public static final int kNumStreamBaseStateFields = 4;
  }

  public static class ProcessFlags {
    public static final int kProcessFlagNone = 0;
    public static final int kProcessFlagDetached = 1 << 0;
    public static final int kProcessFlagWindowsHide = 1 << 1;
    public static final int kProcessFlagWindowsVerbatimArguments = 1 << 2;
  }

  public static class FsStatsOffset {
    public static final int kDev = 0;
    public static final int kMode = 1;
    public static final int kNlink = 2;
    public static final int kUid = 3;
    public static final int kGid = 4;
    public static final int kRdev = 5;
    public static final int kBlkSize = 6;
    public static final int kIno = 7;
    public static final int kSize = 8;
    public static final int kBlocks = 9;
    public static final int kATimeSec = 10;
    public static final int kATimeNsec = 11;
    public static final int kMTimeSec = 12;
    public static final int kMTimeNsec = 13;
    public static final int kCTimeSec = 14;
    public static final int kCTimeNsec = 15;
    public static final int kBirthTimeSec = 16;
    public static final int kBirthTimeNsec = 17;
    public static final int kFsStatsFieldsNumber = 18;
  }

  public static class FsStatFsOffset {
    public static final int kType = 0;
    public static final int kBSize = 1;
    public static final int kFrSize = 2;
    public static final int kBlocks = 3;
    public static final int kBFree = 4;
    public static final int kBAvail = 5;
    public static final int kFiles = 6;
    public static final int kFFree = 7;
    public static final int kFsStatFsFieldsNumber = 8;
    public static final int kFsStatsBufferLength = kFsStatFsFieldsNumber * 2;
  }

  public static class TickInfo {
    public static final int kHasTickScheduled = 0;
    public static final int kHasRejectionToWarn = 1;
    public static final int kFieldsCount = kHasRejectionToWarn + 1;
  }

  public static class StringDecoder {
    public static final int kIncompleteCharactersStart = 0;
    public static final int kIncompleteCharactersEnd = 4;
    public static final int kMissingBytes = 4;
    public static final int kBufferedBytes = 5;
    public static final int kEncodingField = 6;
    public static final int kNumFields = 7;
  }

  public static class PrivateSymbols {
    public static final SymbolKey arrow_message_private_symbol =
        new SymbolKey("node:arrowMessage", SymbolKey.Kind.REGULAR);
    public static final SymbolKey contextify_context_private_symbol =
        new SymbolKey("node:contextify:context", SymbolKey.Kind.REGULAR);
    public static final SymbolKey decorated_private_symbol =
        new SymbolKey("node:decorated", SymbolKey.Kind.REGULAR);
    public static final SymbolKey empty_context_frame_sentinel_symbol =
        new SymbolKey("node:empty_context_frame_sentinel", SymbolKey.Kind.REGULAR);
    public static final SymbolKey ffi_pointer_address_private_symbol =
        new SymbolKey("node:ffi:pointer_address", SymbolKey.Kind.REGULAR);
    public static final SymbolKey transfer_mode_private_symbol =
        new SymbolKey("node:transfer_mode", SymbolKey.Kind.REGULAR);
    public static final SymbolKey host_defined_option_symbol =
        new SymbolKey("node:host_defined_option_symbol", SymbolKey.Kind.REGULAR);
    public static final SymbolKey js_transferable_wrapper_private_symbol =
        new SymbolKey("node:js_transferable_wrapper", SymbolKey.Kind.REGULAR);
    public static final SymbolKey entry_point_module_private_symbol =
        new SymbolKey("node:entry_point_module", SymbolKey.Kind.REGULAR);
    public static final SymbolKey entry_point_promise_private_symbol =
        new SymbolKey("node:entry_point_promise", SymbolKey.Kind.REGULAR);
    public static final SymbolKey module_source_private_symbol =
        new SymbolKey("node:module_source", SymbolKey.Kind.REGULAR);
    public static final SymbolKey module_export_names_private_symbol =
        new SymbolKey("node:module_export_names", SymbolKey.Kind.REGULAR);
    public static final SymbolKey module_circular_visited_private_symbol =
        new SymbolKey("node:module_circular_visited", SymbolKey.Kind.REGULAR);
    public static final SymbolKey module_export_private_symbol =
        new SymbolKey("node:module_export", SymbolKey.Kind.REGULAR);
    public static final SymbolKey module_first_parent_private_symbol =
        new SymbolKey("node:module_first_parent", SymbolKey.Kind.REGULAR);
    public static final SymbolKey module_last_parent_private_symbol =
        new SymbolKey("node:module_last_parent", SymbolKey.Kind.REGULAR);
    public static final SymbolKey napi_type_tag =
        new SymbolKey("node:napi:type_tag", SymbolKey.Kind.REGULAR);
    public static final SymbolKey napi_wrapper =
        new SymbolKey("node:napi:wrapper", SymbolKey.Kind.REGULAR);
    public static final SymbolKey untransferable_object_private_symbol =
        new SymbolKey("node:untransferableObject", SymbolKey.Kind.REGULAR);
    public static final SymbolKey exit_info_private_symbol =
        new SymbolKey("node:exit_info_private_symbol", SymbolKey.Kind.REGULAR);
    public static final SymbolKey promise_trace_id =
        new SymbolKey("node:promise_trace_id", SymbolKey.Kind.REGULAR);
    public static final SymbolKey source_map_data_private_symbol =
        new SymbolKey("node:source_map_data_private_symbol", SymbolKey.Kind.REGULAR);
  }
}
