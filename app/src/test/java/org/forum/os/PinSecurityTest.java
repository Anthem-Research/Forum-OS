package org.forum.os;

import org.junit.Test;
import static org.junit.Assert.*;

public class PinSecurityTest {
    @Test public void saltedHashesVerifyAndRejectWrongPins() {
        String one = PinHash.create("5826");
        String two = PinHash.create("5826");
        assertNotEquals(one, two);
        assertTrue(PinHash.matches("5826", one));
        assertFalse(PinHash.matches("5827", one));
        assertFalse(PinHash.matches("5826", "damaged"));
        assertFalse(PinHash.matches("5826", "AA==:AA=="));
    }
    @Test public void acceptsOnlyFourAsciiDigits() {
        assertTrue(PinHash.valid("0209"));
        for (String value : new String[] {null, "", "123", "12345", "123a", "１２３４", "1234\n"}) assertFalse(PinHash.valid(value));
    }
    @Test public void bruteForceDelaysGrowAndAreBounded() {
        assertEquals(0, AttemptPolicy.delayMillis(4));
        assertEquals(30_000, AttemptPolicy.delayMillis(5));
        assertEquals(60_000, AttemptPolicy.delayMillis(6));
        assertEquals(300_000, AttemptPolicy.delayMillis(9));
        assertEquals(300_000, AttemptPolicy.delayMillis(Integer.MAX_VALUE));
    }
}
