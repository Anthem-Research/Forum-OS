package org.forum.os;

final class AttemptPolicy {
    static long delayMillis(int failures) {
        if (failures < 5) return 0;
        return Math.min(300_000L, 30_000L << Math.min(4, failures - 5));
    }
}
