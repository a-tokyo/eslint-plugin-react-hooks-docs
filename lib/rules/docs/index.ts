'use strict'

import { Context, Program, Node } from './types'

/** Checks if a node has documentation via * Block comments */
const nodeHasDocumentation = (context: Context, node: Node): boolean => {
  const comments = context.getSourceCode().getCommentsBefore(node);

  return (
    comments &&
    comments.length &&
    comments.some(
      (comment) =>
        comment.type === "Block" && comment.value.includes("*")
    )
  )
}

module.exports = {
  meta: {
    docs: {
      description: 'Lints react hooks documentation',
      url: 'https://github.com/a-tokyo/stylelint-rem-over-px',
      recommended: true,
    },
    fixable: undefined,
    schema: [
      {
        type: 'object',
        properties: {
          skipDeclarations: {
            type: 'boolean',
          },
          skipHooks: {
            type: 'array',
            items: {
              type: 'string',
            }
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create: (context: Context) => {
    const options = context.options[0];

    /** skip declarations to avoid issues with useState useReft etc... */
    const skipDeclarations: boolean = options?.skipDeclarations ?? true;
    const skipHooks: string[] = options?.skipHooks ?? [];

    return {
      Program({ body }: Program) {
        body
          .filter(({ type }) =>
            [
              'FunctionDeclaration',
              'VariableDeclaration',
              'ExportNamedDeclaration',
              'ExportDefaultDeclaration',
            ].includes(type),
          )
          .map(node => {
            let declarations: Node = node

            const isExportableDeclaration = (): boolean =>
              ['ExportNamedDeclaration', 'ExportDefaultDeclaration'].includes(
                node.type,
              )

            if (isExportableDeclaration()) {
              declarations =
                node['declaration']?.['declarations']?.[0]['init'] ||
                node['declaration']
            } else {
              declarations = node['declarations']?.[0]['init'] || node
            }

            return declarations?.['body']?.['body']
          })
          .filter(Boolean)
          .forEach((declarations: Node[]) => {
            let nodes: Node[] = []

            declarations.forEach?.(node => {
              if (node['type'] === 'ExpressionStatement') {
                nodes.push(node['expression'])
              }

              // Intentionally skip variable declarations to avoid throwing errors for useState and useRef etc...
              if (!skipDeclarations && node['type'] === 'VariableDeclaration') {
                nodes.push(...node['declarations'])
              }
            })

            const hooks = nodes
              ?.map(
                ({ type, callee, init }) =>
                  (type === 'CallExpression'
                    ? [type, callee]
                    : type === 'VariableDeclarator'
                    ? [type, init]
                    : []) as [Node['type'], Node],
              )
              .filter(node => node.length === 2)
              .map(([type, declaration]) => {
                switch (type) {
                  case 'MemberExpression':
                    return declaration.property

                  case 'CallExpression':
                    return declaration.type === 'MemberExpression'
                      ? declaration.property
                      : declaration.callee || declaration

                  case 'VariableDeclarator':
                  default:
                    return declaration?.callee?.property || declaration?.callee
                }
              })
              .filter(Boolean)
              .filter(
                hook =>
                  hook.name?.slice(0, 3) === 'use'
              ).filter(
                hook => !skipHooks.includes(hook.name)
              )

            hooks.forEach((hook) => {
              if (!nodeHasDocumentation(context, hook)) {
                context
                  .report(
                    hook,
                    `Missing documentation for "${hook.name}" hook.`,
                  )
              }
            })
          })
      },
    }
  },
}
