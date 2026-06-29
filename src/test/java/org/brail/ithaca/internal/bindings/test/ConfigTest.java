package org.brail.ithaca.internal.bindings.test;

import static org.junit.jupiter.api.Assertions.*;

import java.util.Locale;
import org.brail.ithaca.internal.Environment;
import org.brail.ithaca.internal.bindings.Config;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;

class ConfigTest {

  private Context context;

  @BeforeEach
  void setUp() {
    context = Context.enter();
    context.setLanguageVersion(Context.VERSION_ES6);
  }

  @AfterEach
  void tearDown() {
    Context.exit();
  }

  @Test
  void testGetDefaultLocale() {
    var scope = context.initStandardObjects();
    Scriptable configObj = Config.init(new Environment(), context, scope);

    Object fn = configObj.get("getDefaultLocale", configObj);
    Object result =
        ((org.mozilla.javascript.Function) fn).call(context, scope, null, new Object[0]);
    Locale expectedLocale = Locale.getDefault();
    assertEquals(expectedLocale.toString(), result);
  }
}
