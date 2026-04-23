package com.water.water_system.util;

import java.util.regex.Pattern;

public class ValidationUtil {

    private ValidationUtil() {
        // Prevent instantiation
    }

    public static boolean isValidPhoneNumber(String phone) {
        if (phone == null || phone.isEmpty()) {
            return false;
        }
        // Simple phone validation - adjust as needed
        String phoneRegex = "^\\+?[0-9]{10,15}$";
        return Pattern.matches(phoneRegex, phone.replaceAll("[\\s-]", ""));
    }

    public static boolean isValidName(String name) {
        if (name == null || name.isEmpty()) {
            return false;
        }
        // Allow letters, spaces, hyphens, and apostrophes
        String nameRegex = "^[a-zA-Z\\s\\-'\\.]+$";
        return Pattern.matches(nameRegex, name);
    }

    public static boolean isValidMonth(String month) {
        if (month == null || month.isEmpty()) {
            return false;
        }
        String[] validMonths = {
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        };
        for (String validMonth : validMonths) {
            if (validMonth.equalsIgnoreCase(month)) {
                return true;
            }
        }
        return false;
    }

    public static boolean isPositiveNumber(Number number) {
        return number != null && number.doubleValue() > 0;
    }

    public static boolean isNonNegativeNumber(Number number) {
        return number != null && number.doubleValue() >= 0;
    }
}