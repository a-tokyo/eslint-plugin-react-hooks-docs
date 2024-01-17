# A rule to enforce hooks docs. (docs)

## Rule Details

This rule warns about the missing docs in hooks.

Examples of **incorrect** code for this rule:

```js
/**
 *  "hooks/sort": 2
 */
import React, { useEffect } from 'react'

// 👎
const MyComponent = () => {
    useEffect(() => {}, []);
};
```

Examples of **correct** code for this rule:

```js
/**
 *  "hooks/sort": 2
 */
import { useContext, useState } from 'react'

// 👍
const MyComponent = () => {
    /** documentation for hook */
    useEffect(() => {}, []);
};
```

## Extra options
- skipDeclarations:
  - Type: boolean
  - Default: true
  - Description: When set to true, this option allows skipping documentation checks for hook declarations, eg: useRef and useState.
- skipHooks:
  - Type: Array of strings
  - Default: []
  - Description: An array of hook names for which documentation checks will be skipped. This option allows you to selectively exclude certain hooks from the documentation requirement. For example, ["useEffect", "useCallback"] will exempt these specified hooks from mandatory documentation checks.
