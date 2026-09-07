package org.forum.os;

import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Base64;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;

final class PinHash {
    private static final int ITERATIONS = 120_000;
    static boolean valid(String pin) { return pin != null && pin.matches("[0-9]{4}"); }
    static String create(String pin) {
        if (!valid(pin)) throw new IllegalArgumentException("PIN must contain four digits");
        byte[] salt = new byte[16];
        new SecureRandom().nextBytes(salt);
        return Base64.getEncoder().encodeToString(salt) + ":" + Base64.getEncoder().encodeToString(derive(pin, salt));
    }
    static boolean matches(String pin, String stored) {
        if (!valid(pin) || stored == null) return false;
        try {
            String[] parts = stored.split(":", -1);
            if (parts.length != 2) return false;
            byte[] salt = Base64.getDecoder().decode(parts[0]);
            byte[] expected = Base64.getDecoder().decode(parts[1]);
            if (salt.length != 16 || expected.length != 32) return false;
            return MessageDigest.isEqual(expected, derive(pin, salt));
        } catch (IllegalArgumentException e) { return false; }
    }
    private static byte[] derive(String pin, byte[] salt) {
        char[] chars = pin.toCharArray();
        PBEKeySpec spec = new PBEKeySpec(chars, salt, ITERATIONS, 256);
        try { return SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).getEncoded(); }
        catch (GeneralSecurityException e) { throw new IllegalStateException("PIN protection unavailable", e); }
        finally { spec.clearPassword(); Arrays.fill(chars, '\0'); }
    }
}
