Open the file `ImplementProductEntityService.java`. Go to line 1, column 1. You will find an illegal character, likely the '⚠️' emoji or a similar non-standard symbol. Delete this character. Ensure that the file starts with a valid Java package declaration (e.g., `package com.carnival.service;`) or an import statement, followed by your class definition. For example:

java
// Before (problematic)
⚠️package com.carnival.service;

// After (fixed)
package com.carnival.service;

import org.springframework.stereotype.Service;

@Service
public class ImplementProductEntityService {
    // ... rest of your code
}


After removing the illegal character, rebuild your project.