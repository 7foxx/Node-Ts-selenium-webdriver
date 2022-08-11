## 启动

```json
yarn start / npm rum start
```

## Node + TypeScript 配置

**前置需求**

1. 全局安装 node
2. 全局安装 typescript
3. 项目中安装 nodemon

**在 ` package.json ` 中 `scripts`配置** 

```json
"start": "nodemon --watch src/**/*.ts --exec \"ts-node -r tsconfig-paths/register\" src/index.ts --files",
```

**`tsconfig.json` 配置项**

```json
{
  "compilerOptions": {
    "target": "es2018",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    // 改成 commonjs，我们就可以使用 import/export
    "module": "commonjs",
    // --- 开启装饰器功能 ----
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    // --- 结束         ----
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "noEmit": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}

```

**之后就可以在启用服务时激活 ts 的语法检测啦**