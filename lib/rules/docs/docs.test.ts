'use strict'

import { RuleTester, Rule, Linter } from 'eslint'
import * as rule from '@rules/docs'

const Tester = new RuleTester()

const parserOptions: Linter.ParserOptions = {
  ecmaVersion: 6,
  sourceType: 'module',
  ecmaFeatures: {
    jsx: true,
  },
}

const options = [{}]

Tester.run('hooks/sort', rule as unknown as Rule.RuleModule, {
  valid: [
    {
      code: `
      import React, { useEffect } from 'react';

      function ComponentA() {
        /** documentation for effect */
        useEffect(() => {}, []);

        return null
      }

      export default ComponentA
     `,
      parserOptions,
      options,
    },
    {
      code: `
      import React, { useEffect, useState, useRef } from 'react';

      function ComponentA() {
        const [state, setState] = useState(0);
        const ref = useRef(null);

        /** documentation for effect */
        useEffect(() => {}, []);

        /** documentation for effect */
        useCustomHook();

        return null
      }

      export default ComponentA
     `,
      parserOptions,
      options,
    },
    // test option skipHooks
    {
      code: `
          import React, { useEffect } from 'react';
    
          export const ComponentA = () => {
            useEffect(() => {});
    
            return null
          }
          `,
      parserOptions,
      options: [
        {
          ...options[0],
          skipHooks: ['useEffect'],
        },
      ],
    },
  ],
  invalid: [
    {
      code: `
      import React, { useEffect } from 'react';

      export const ComponentA = () => {
        useEffect(() => {}, []);

        useCustomHook();

        return null
      }
      `,
      errors: [
        {
          message: 'Missing documentation for "useEffect" hook.',
        },
        {
          message: 'Missing documentation for "useCustomHook" hook.',
        },
      ],
      parserOptions,
      options,
    },
    // test option skipDeclarations
    {
      code: `
      import React, { useState } from 'react';

      export const ComponentA = () => {
        const [state, setState] = useState(0);

        return null
      }
      `,
      errors: [
        {
          message: 'Missing documentation for "useState" hook.',
        },
      ],
      parserOptions,
      options: [
        {
          ...options[0],
          skipDeclarations: false,
        },
      ],
    },
  ],
})
