package org.brail.ithaca.internal.common;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface NodeOption {
  public enum Type {
    BOOLEAN,
    INTEGER,
    UINTEGER,
    STRING,
    HOSTPORT,
    STRINGLIST,
  }

  String name();

  String shortName() default "";

  String help() default "";

  Type type() default Type.STRING;
}
