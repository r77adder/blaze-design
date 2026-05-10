export default function (plop) {
  plop.setHelper('lbrace', () => '{');
  plop.setHelper('rbrace', () => '}');

  plop.setGenerator('component', {
    description: 'Create a new component (vetted lib surface or staging WIP)',
    prompts: [
      { type: 'input', name: 'name', message: 'Component name (PascalCase):' },
      {
        type: 'list',
        name: 'tier',
        message: 'Tier — vetted ships in lib (1:1 with apps/blaze/src/blaze-ui/); staging is shared-across-prototypes WIP, NOT shipped:',
        choices: [
          { name: 'staging  (default — pick this unless prod blaze-ui already has the component)', value: 'staging' },
          { name: 'vetted   (only pick if a 1:1 equivalent exists in apps/blaze/src/blaze-ui/)', value: 'components' },
        ],
        default: 'staging',
      },
    ],
    actions: [
      { type: 'add', path: 'src/{{tier}}/{{pascalCase name}}/{{pascalCase name}}.tsx', templateFile: 'plop/component/Component.tsx.hbs' },
      { type: 'add', path: 'src/{{tier}}/{{pascalCase name}}/{{pascalCase name}}.module.scss', templateFile: 'plop/component/Component.module.scss.hbs' },
      { type: 'add', path: 'src/{{tier}}/{{pascalCase name}}/{{pascalCase name}}.test.tsx', templateFile: 'plop/component/Component.test.tsx.hbs' },
      { type: 'add', path: 'src/{{tier}}/{{pascalCase name}}/{{pascalCase name}}.stories.tsx', templateFile: 'plop/component/Component.stories.tsx.hbs' },
      { type: 'add', path: 'src/{{tier}}/{{pascalCase name}}/Types.ts', templateFile: 'plop/component/Types.ts.hbs' },
      { type: 'add', path: 'src/{{tier}}/{{pascalCase name}}/index.ts', templateFile: 'plop/component/index.ts.hbs' },
      { type: 'append', path: 'src/{{tier}}/index.ts', template: "export {{lbrace}} {{pascalCase name}} {{rbrace}} from './{{pascalCase name}}';\n// Add additional types as needed (e.g. {{pascalCase name}}Variant, {{pascalCase name}}Size).\nexport type {{lbrace}} {{pascalCase name}}Props {{rbrace}} from './{{pascalCase name}}';\n" },
    ],
  });

  plop.setGenerator('prototype', {
    description: 'Create a new prototype',
    prompts: [{ type: 'input', name: 'name', message: 'Prototype slug (kebab-case):' }],
    actions: [
      { type: 'add', path: 'prototypes/{{kebabCase name}}/index.tsx', templateFile: 'plop/prototype/index.tsx.hbs' },
      { type: 'add', path: 'prototypes/{{kebabCase name}}/GAPS.md', template: "# Component gaps for {{kebabCase name}}\n\nList components/states this prototype needs that the lib doesn't support yet.\n" },
    ],
  });

  plop.setGenerator('icon', {
    description: 'Create a new icon',
    prompts: [
      { type: 'input', name: 'name', message: 'Icon name (PascalCase):' },
      { type: 'list', name: 'size', message: 'Size:', choices: ['12', '14', '16', '20', '24', '30', '32', '36', '40', '46'] },
    ],
    actions: [
      { type: 'add', path: 'src/icons/{{size}}/{{pascalCase name}}.tsx', templateFile: 'plop/icon/Icon.tsx.hbs' },
      { type: 'add', path: 'src/icons/{{size}}/index.tsx', template: '', skipIfExists: true },
      { type: 'append', path: 'src/icons/{{size}}/index.tsx', template: "export {{lbrace}} default as {{pascalCase name}} {{rbrace}} from './{{pascalCase name}}';\n" },
    ],
  });
}
