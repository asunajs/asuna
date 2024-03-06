import { writeFileSync } from 'fs';
import {
  resolveSchema,
  defineUntypedSchema,
  generateTypes,
  type Schema,
  applyDefaults,
} from 'untyped';

const defaultPlanet = defineUntypedSchema({
  $schema: {
    required: ['token', 'phone'],
    title: '移动云盘配置',
  } as Schema,
  token: {
    $schema: {
      description: 'cookie authorization 字段',
      type: 'string',
    },
  },
  phone: {
    $schema: {
      description: '手机号',
      type: 'string',
    },
  },
  auth: {
    $schema: {
      description: 'auth_token',
      type: 'string',
    },
  },
  shake: {
    $schema: {
      description: '摇一摇配置',
      type: 'object',
    },
    enable: {
      $resolve: (val) => Boolean(val) || false,
      $schema: {
        description: '是否开启该功能',
      },
    },
    num: {
      $resolve: (val) => Number(val) || 15,
      $schema: {
        description: '摇一摇次数',
      },
    },
    delay: {
      $resolve: (val) => Number(val) || 2,
      $schema: {
        description: '每次间隔时间（秒）',
      },
    },
  },
  garden: {
    $schema: {
      description: '果园配置',
      type: 'object',
    },
    enable: {
      $resolve: (val) => Boolean(val) || false,
      $schema: {
        description: '是否开启该功能',
      },
    },
  },
});

// 将 schema 写入 schema.json 文件中

const schema = await resolveSchema(defaultPlanet);

writeFileSync('schema.json', JSON.stringify(schema, null, 2));

// 将 types 写入 config.d.ts 文件中

const types = generateTypes(schema);

writeFileSync('config.d.ts', types);

// 将 defaultConfig 写入 defaults.json 文件中

const defaultConfig = await applyDefaults(defaultPlanet, {});

writeFileSync('defaults.json', JSON.stringify(defaultConfig, null, 2));

// 将 markdown 写入 config.md 文件中
