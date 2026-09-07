package org.forum.os;

import android.os.SystemClock;

final class ParentSession {
    private static volatile long expires;
    static void open() { expires = SystemClock.elapsedRealtime() + 120_000; }
    static boolean valid() { return expires > SystemClock.elapsedRealtime(); }
    static void touch() { if (valid()) open(); }
    static void close() { expires = 0; }
}
